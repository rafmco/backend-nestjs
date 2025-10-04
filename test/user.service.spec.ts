import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../src/user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from '../src/user/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UserService Tests', () => {
  let userService: UserService;

  // Mock do repositório
  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = moduleFixture.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@test.com' },
        { id: '2', name: 'User 2', email: 'user2@test.com' },
      ];

      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await userService.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });

    it('should throw NotFoundException when no users found', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      await expect(userService.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: '1', name: 'User 1', email: 'user1@test.com' };

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await userService.findOne('1');

      expect(result).toEqual(mockUser);
      // Verifica se findOneBy foi chamado 2 vezes com os mesmos parâmetros
      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });

    it('should throw NotFoundException when user not found', async () => {
      // Apenas uma chamada é necessária aqui, pois vai falhar na primeira
      mockUserRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(userService.findOne('999')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: '999' });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        name: 'New User',
        email: 'newuser@test.com',
        password: 'password123',
        salt: 'somesalt',
      };

      const mockUser = {
        id: 'new-uuid',
        ...createUserDto,
        active: 1,
        createdAt: new Date(),
      };

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await userService.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        name: 'Updated User',
      };

      const updateResult = { affected: 1 };

      mockUserRepository.update.mockResolvedValue(updateResult);

      const result = await userService.update('1', updateUserDto);

      expect(result).toEqual(updateResult);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        '1',
        updateUserDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const deleteResult = { affected: 1 };

      mockUserRepository.delete.mockResolvedValue(deleteResult);

      const result = await userService.remove('1');

      expect(result).toEqual(deleteResult);
      expect(mockUserRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
