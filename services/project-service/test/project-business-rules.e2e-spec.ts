import { BadRequestException } from '@nestjs/common';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({})),
}));

import { ProjectsService } from '../src/projects/services/projects.service';

describe('Reglas de negocio de Projects Service', () => {
  let service: ProjectsService;

  const projectId = '51120c65-62f8-42c1-b531-456f2eb3e4fd';
  const userId = '6f0b26c4-eecf-4af7-8e35-835d016a2b94';

  beforeEach(() => {
    service = new ProjectsService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Falla al agregar un colaborador a un cuarto proyecto', async () => {
    jest
      .spyOn(service as any, 'ensureProjectIsNotFinished')
      .mockResolvedValue({
        id: projectId,
        status: 'TODO',
      });

    jest
      .spyOn(service as any, 'ensureUserExists')
      .mockResolvedValue({
        id: userId,
        user_metadata: {
          role: 'DEVELOPER',
        },
      });

    jest
      .spyOn(service as any, 'getActiveProjectCountForUser')
      .mockResolvedValue(3);

    const maybeSingle = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    (service as any).supabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle,
            }),
          }),
        }),
      }),
    };

    await expect(
      service.addProjectMember(projectId, {
        userId,
        projectRole: 'DEVELOPER',
      }),
    ).rejects.toEqual(
      new BadRequestException(
        'El profesional ya alcanzó el máximo de 3 proyectos activos',
      ),
    );

    expect(
      (service as any).getActiveProjectCountForUser,
    ).toHaveBeenCalledWith(userId);
  });

  it('Falla al agregar un colaborador a un proyecto finalizado', async () => {
  jest
    .spyOn(service as any, 'ensureProjectIsNotFinished')
    .mockRejectedValue(
      new BadRequestException(
        'No se pueden modificar tareas de un proyecto finalizado',
      ),
    );

  await expect(
    service.addProjectMember(projectId, {
      userId,
      projectRole: 'DEVELOPER',
        }),
    ).rejects.toEqual(
        new BadRequestException(
        'No se pueden modificar tareas de un proyecto finalizado',
        ),
    );

    expect(
        (service as any).ensureProjectIsNotFinished,
    ).toHaveBeenCalledWith(projectId);
    });

    it('Falla al agregar dos veces el mismo colaborador al mismo proyecto', async () => {
    jest
        .spyOn(service as any, 'ensureProjectIsNotFinished')
        .mockResolvedValue({
        id: projectId,
        status: 'TODO',
        });

    jest
        .spyOn(service as any, 'ensureUserExists')
        .mockResolvedValue({
        id: userId,
        user_metadata: {
            role: 'DEVELOPER',
        },
        });

    const maybeSingle = jest.fn().mockResolvedValue({
        data: {
        id: 'membership-id',
        project_id: projectId,
        user_id: userId,
        },
        error: null,
    });

    (service as any).supabase = {
        from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                maybeSingle,
            }),
            }),
        }),
        }),
    };

    await expect(
        service.addProjectMember(projectId, {
        userId,
        projectRole: 'DEVELOPER',
        }),
    ).rejects.toEqual(
        new BadRequestException(
        'Este usuario ya pertenece al proyecto',
        ),
    );
    });

    it('Falla al crear una tarea si el responsable no pertenece al proyecto', async () => {
    const requestingUserId = '11111111-1111-4111-8111-111111111111';
    const responsibleId = '22222222-2222-4222-8222-222222222222';

    jest
        .spyOn(service as any, 'ensureProjectAccess')
        .mockResolvedValue(undefined);

    jest
        .spyOn(service as any, 'ensureUserExists')
        .mockResolvedValue({
        id: responsibleId,
        user_metadata: {
            role: 'DEVELOPER',
        },
        });

    jest
        .spyOn(service as any, 'ensureUserIsProjectMember')
        .mockRejectedValue(
        new BadRequestException(
            'El responsable debe pertenecer al proyecto',
        ),
        );

    (service as any).supabase = {
        from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
                data: {
                id: projectId,
                status: 'TODO',
                },
                error: null,
            }),
            }),
        }),
        }),
    };

    await expect(
        service.createTask(
        projectId,
        {
            projectId,
            title: 'Implementar módulo de reportes',
            description: 'Crear la funcionalidad solicitada',
            responsibleId,
            startDate: '2026-06-11',
            endDate: '2026-06-20',
        },
        requestingUserId,
        'MANAGER',
        ),
    ).rejects.toEqual(
        new BadRequestException(
        'El responsable debe pertenecer al proyecto',
        ),
    );

    expect(
        (service as any).ensureUserIsProjectMember,
    ).toHaveBeenCalledWith(projectId, responsibleId);
    });

    it('Establece el progreso en 100% al dar click en "Finalizar tarea"', async () => {
    const taskId = '33333333-3333-4333-8333-333333333333';
    const requestingUserId = '11111111-1111-4111-8111-111111111111';

    const existingTask = {
        id: taskId,
        project_id: projectId,
        responsible_id: requestingUserId,
        status: 'IN_PROGRESS',
        progress: 60,
        end_date: null,
    };

    jest
        .spyOn(service as any, 'ensureUserExists')
        .mockResolvedValue({
        id: requestingUserId,
        });

    jest
        .spyOn(service as any, 'ensureTaskAccess')
        .mockResolvedValue(existingTask);

    jest
        .spyOn(service as any, 'ensureProjectIsNotFinished')
        .mockResolvedValue({
        id: projectId,
        status: 'IN_PROGRESS',
        });

    jest
        .spyOn(service as any, 'ensureUserCanUpdateTask')
        .mockReturnValue(undefined);

    const updatedTask = {
        ...existingTask,
        status: 'DONE',
        progress: 100,
        end_date: '2026-06-11T12:00:00.000Z',
    };

    const updateSingle = jest.fn().mockResolvedValue({
        data: updatedTask,
        error: null,
    });

    const updateSelect = jest.fn().mockReturnValue({
        single: updateSingle,
    });

    const updateEq = jest.fn().mockReturnValue({
        select: updateSelect,
    });

    const update = jest.fn().mockReturnValue({
        eq: updateEq,
    });

    const historyInsert = jest.fn().mockResolvedValue({
        error: null,
    });

    (service as any).supabase = {
        from: jest
        .fn()
        .mockReturnValueOnce({
            update,
        })
        .mockReturnValueOnce({
            insert: historyInsert,
        }),
    };

    const result = await service.updateTaskStatus(
        taskId,
        {
        status: 'DONE',
        progress: 60,
        comment: 'Trabajo completado',
        },
        requestingUserId,
        'DEVELOPER',
    );

    expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
        status: 'DONE',
        progress: 100,
        }),
    );

    expect(result.task.progress).toBe(100);
    expect(result.task.status).toBe('DONE');
    });

});