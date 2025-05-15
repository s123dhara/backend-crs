import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto'
import * as argon2 from 'argon2';


import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ApplicantProfile, DocumentProfile, EducationProfile, ExperienceProfile, SkillProfile } from './entity';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectDataSource() private readonly dataSource: DataSource) { }


  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      const existingUser = await this.userModel.findOne({ email: createUserDto.email });
      if (existingUser != null) {
        return { status: false, statusCode: HttpStatus.BAD_REQUEST, message: "User Already Exist" };
      }

      const createdUser = new this.userModel(createUserDto);
      const salt = randomBytes(16).toString('hex');
      const hashPassword = await argon2.hash(createUserDto.password_hash + salt);
      createdUser.password_hash = hashPassword;
      createdUser.salt = salt;


      const savedUser = await createdUser.save();
      return { statusCode: HttpStatus.CREATED, message: "User added Successfully", status: true };
    } catch (error) {
      return { status: false, statusCode: HttpStatus.BAD_GATEWAY, message: "Interval Server Error" }
    }
  }

  async findAll(): Promise<any> {
    try {
      const users = await this.userModel.find({}, {
        _id: 1,
        email: 1,
        role: 1,
        status: 1,
        createdAt: 1,
      });

      // console.log('users = ',users)
      // const usersWithId = users.map((user, index) => ({
      //   id: index + 1,
      //   ...user
      // }));

      return {
        status: true,
        statusCode: HttpStatus.OK,
        message: "Request allowed",
        data: users,
      };
    } catch (error) {
      // console.error('FindAll Error:', error);

      return {
        status: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal Server1 Error",
      };
    }
  }


  async findOne(id: string): Promise<any> {
    try {
      const users = await this.userModel.findById(id, {
        _id: 0,
        email: 1,
        role: 1,
        status: 1,
      });

      return {
        status: true,
        statusCode: HttpStatus.OK,
        message: "Request allowed",
        data: users,
      };


    } catch (error) {
      return {
        status: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal Server1 Error",
      };
    }
  }

  async update(id: string, updatedData: any): Promise<any> {
    try {
      const result = await this.userModel.findByIdAndUpdate(id, updatedData);

      if (result) {
        return { status: true, message: "Request Accepted", statusCode: HttpStatus.ACCEPTED };
      } else {
        return { status: false, message: "Failed to update", statusCode: HttpStatus.BAD_GATEWAY };
      }
    } catch (error) {
      return {
        status: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal Server Error",
      };
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const result = await this.userModel.findByIdAndDelete(id);
      console.log(result);
      if (result) {
        return { status: true, statusCode: HttpStatus.OK, message: "Request Accepted" };
      } else {
        return { status: false, statusCode: HttpStatus.BAD_REQUEST, message: "Failed to Delete" };
      }
    } catch (error) {
      return {
        status: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal Server Error",
      };
    }
  }

  async handleApplicationForm(formData: any, userEmail: string, files: any): Promise<any> {

    const user = await this.userModel.findOne({ email: userEmail });
    if (!user) {
      return { status: false, message: "User not found!", statusCode: HttpStatus.BAD_REQUEST };
    }
    const user_id = (user?._id as any).toString() || null;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {

      const profile_id = uuidv4();
      const newProfile = queryRunner.manager.create(ApplicantProfile, {
        profile_id,
        user_id: user_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        contact_email: formData.contact_email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postal_code,
        headline: formData.headline,
        summary: formData.summary,
        is_profile_complete: true,
        is_public: formData.is_public ?? false,
      });

      await queryRunner.manager.save(ApplicantProfile, newProfile);

      // 2. Loop through education entries
      for (const edu of formData.education) {
        const newEducation = queryRunner.manager.create(EducationProfile, {
          education_id: uuidv4(),
          profile: newProfile,
          institution: edu.institution,
          degree: edu.degree,
          field_of_study: edu.field_of_study,
          start_date: edu.start_date,
          end_date: edu.end_date,
          grade: edu.grade,
          activities: edu.activities,
          description: edu.description,
          is_current: edu.is_current,
        });

        await queryRunner.manager.save(EducationProfile, newEducation);
      }

      // 3. Loop through Experience entries
      for (const exp of formData.experience) {
        const newExperience = queryRunner.manager.create(ExperienceProfile, {
          experience_id: uuidv4(),
          profile: newProfile,
          company: exp.company,
          title: exp.title,
          location: exp.location,
          start_date: exp.start_date,
          end_date: exp.end_date,
          is_current: exp.is_current,
          description: exp.description,
        })

        await queryRunner.manager.save(ExperienceProfile, newExperience);
      }

      // 4. Loop through Skills Entries
      for (const skill of formData.skills) {
        const newSkill = queryRunner.manager.create(SkillProfile, {
          skill_id: uuidv4(),
          profile: newProfile,
          name: skill.name,
          proficiency_level: skill.proficiency_level
        })

        await queryRunner.manager.save(SkillProfile, newSkill);
      }


      // 5. Loop through Document Entrities 
      for (const file of files) {
        const newDocument = queryRunner.manager.create(DocumentProfile, {
          document_id: uuidv4(),
          profile: newProfile, 
          document_type: file.fieldname, 
          title: file.originalname,
          file_path: file.path, 
          file_size: file.size,
          file_type: file.mimetype,
          is_verified: false,
        });

        await queryRunner.manager.save(DocumentProfile, newDocument);
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Application submitted successfully',
        status: true,
        profile_id,
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error.message)
      return {
        status: false,
        message: "Internal Server Error, Failed to submit application",
        statusCode: HttpStatus.BAD_GATEWAY
      }
    }
    finally {
      await queryRunner.release();
    }
  }

}
