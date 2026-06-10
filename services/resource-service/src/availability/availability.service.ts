import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.constants';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async create(createAvailabilityDto: CreateAvailabilityDto) {
    const {
      userId,
      status,
      weeklyHours,
      availableFrom,
      availableTo,
      notes,
    } = createAvailabilityDto;

    const { data, error } = await this.supabase
      .from('resource_availability')
      .insert({
        user_id: userId,
        status,
        weekly_hours: weeklyHours,
        available_from: availableFrom ?? null,
        available_to: availableTo ?? null,
        notes: notes ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      message: 'Disponibilidad registrada correctamente',
      availability: data,
    };
  }

  async findAll() {
    const { data, error } = await this.supabase
      .from('resource_availability')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      availabilities: data ?? [],
    };
  }

  async findByUserId(userId: string) {
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

    if (!data) {
      throw new NotFoundException(
        'No se encontró disponibilidad para este usuario',
      );
    }

    return {
      success: true,
      availability: data,
    };
  }

  async updateByUserId(
    userId: string,
    updateAvailabilityDto: UpdateAvailabilityDto,
  ) {
    const { data: existingAvailability, error: findError } =
      await this.supabase
        .from('resource_availability')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (findError) {
      throw new InternalServerErrorException(findError.message);
    }

    if (!existingAvailability) {
      throw new NotFoundException(
        'No se encontró disponibilidad para este usuario',
      );
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updateAvailabilityDto.status !== undefined) {
      updateData.status = updateAvailabilityDto.status;
    }

    if (updateAvailabilityDto.weeklyHours !== undefined) {
      updateData.weekly_hours = updateAvailabilityDto.weeklyHours;
    }

    if (updateAvailabilityDto.availableFrom !== undefined) {
      updateData.available_from = updateAvailabilityDto.availableFrom;
    }

    if (updateAvailabilityDto.availableTo !== undefined) {
      updateData.available_to = updateAvailabilityDto.availableTo;
    }

    if (updateAvailabilityDto.notes !== undefined) {
      updateData.notes = updateAvailabilityDto.notes;
    }

    const { data, error } = await this.supabase
      .from('resource_availability')
      .update(updateData)
      .eq('id', existingAvailability.id)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      message: 'Disponibilidad actualizada correctamente',
      availability: data,
    };
  }



}