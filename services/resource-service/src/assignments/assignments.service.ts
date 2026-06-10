import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.constants';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

const MAX_ACTIVE_PROJECTS = 3;
const MAX_ALLOCATION_PERCENTAGE = 100;

@Injectable()
export class AssignmentsService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  private async getLatestAvailability(userId: string) {
    const { data, error } = await this.supabase
      .from('resource_availability')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  private async getActiveAssignments(userId: string) {
    const { data, error } = await this.supabase
      .from('resource_assignments')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ACTIVE');

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data ?? [];
  }

  async create(createAssignmentDto: CreateAssignmentDto) {
    const {
      userId,
      projectId,
      roleInProject,
      allocationPercentage,
      startDate,
      endDate,
    } = createAssignmentDto;

    const availability = await this.getLatestAvailability(userId);

    if (!availability) {
      throw new BadRequestException(
        'El usuario no tiene disponibilidad registrada',
      );
    }

    if (availability.status === 'UNAVAILABLE') {
      throw new BadRequestException(
        'El usuario no se encuentra disponible para nuevos proyectos',
      );
    }

    const activeAssignments = await this.getActiveAssignments(userId);

    const alreadyAssigned = activeAssignments.some(
      (assignment) => assignment.project_id === projectId,
    );

    if (alreadyAssigned) {
      throw new ConflictException(
        'El usuario ya está asignado activamente a este proyecto',
      );
    }

    if (activeAssignments.length >= MAX_ACTIVE_PROJECTS) {
      throw new BadRequestException(
        `El usuario ya alcanzó el máximo de ${MAX_ACTIVE_PROJECTS} proyectos activos`,
      );
    }

    const currentAllocation = activeAssignments.reduce(
      (total, assignment) =>
        total + Number(assignment.allocation_percentage ?? 0),
      0,
    );

    const resultingAllocation =
      currentAllocation + allocationPercentage;

    if (resultingAllocation > MAX_ALLOCATION_PERCENTAGE) {
      throw new BadRequestException(
        `La asignación supera el 100% de capacidad. Capacidad disponible: ${
          MAX_ALLOCATION_PERCENTAGE - currentAllocation
        }%`,
      );
    }

    const { data, error } = await this.supabase
      .from('resource_assignments')
      .insert({
        user_id: userId,
        project_id: projectId,
        role_in_project: roleInProject ?? null,
        allocation_percentage: allocationPercentage,
        start_date: startDate ?? null,
        end_date: endDate ?? null,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      message: 'Recurso asignado correctamente',
      assignment: data,
      workload: {
        activeProjects: activeAssignments.length + 1,
        allocationPercentage: resultingAllocation,
        remainingCapacity:
          MAX_ALLOCATION_PERCENTAGE - resultingAllocation,
      },
    };
  }

  async findByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('resource_assignments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      assignments: data ?? [],
    };
  }

  async getWorkload(userId: string) {
    const availability = await this.getLatestAvailability(userId);

    if (!availability) {
      throw new NotFoundException(
        'No se encontró disponibilidad para este usuario',
      );
    }

    const activeAssignments = await this.getActiveAssignments(userId);

    const allocationPercentage = activeAssignments.reduce(
      (total, assignment) =>
        total + Number(assignment.allocation_percentage ?? 0),
      0,
    );

    return {
      success: true,
      workload: {
        userId,
        availabilityStatus: availability.status,
        weeklyHours: availability.weekly_hours,
        activeProjects: activeAssignments.length,
        maximumProjects: MAX_ACTIVE_PROJECTS,
        allocationPercentage,
        remainingCapacity: Math.max(
          0,
          MAX_ALLOCATION_PERCENTAGE - allocationPercentage,
        ),
        canReceiveNewAssignments:
          availability.status !== 'UNAVAILABLE' &&
          activeAssignments.length < MAX_ACTIVE_PROJECTS &&
          allocationPercentage < MAX_ALLOCATION_PERCENTAGE,
      },
    };
  }
}