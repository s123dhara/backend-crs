import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecruiterDto } from './dto/create-recruiter.dto';
import { UpdateRecruiterDto } from './dto/update-recruiter.dto';
import { CompanyProfile } from './entity/company-profile.entity';
import { User, UserDocument } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


@Injectable()
export class RecruiterService {

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectRepository(CompanyProfile)
    private companyProfileRepository: Repository<CompanyProfile>,
  ) { }

  create(createRecruiterDto: CreateRecruiterDto) {
    return 'This action adds a new recruiter';
  }

  findAll() {
    return `This action returns all recruiter`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recruiter`;
  }

  update(id: number, updateRecruiterDto: UpdateRecruiterDto) {
    return `This action updates a #${id} recruiter`;
  }

  remove(id: number) {
    return `This action removes a #${id} recruiter`;
  }

  async addCompanyProfile(body: any, user: any): Promise<any> {
    try {

      const existingUser = await this.userModel.findOne({ email: user.email });
      const user_id = (existingUser?._id as any).toString();

      // Add user_id to body
      body.user_id = user_id;

      const profile = this.companyProfileRepository.create(body);
      const savedProfile = await this.companyProfileRepository.save(profile);

      return {
        status: true,
        statusCode: HttpStatus.ACCEPTED,
        message: "Profile Created Succussfully"
      }

    } catch (error) {
      console.error('Error saving company profile:', error);
      return {
        status: false,
        statusCode: HttpStatus.BAD_GATEWAY,
        message: "Internal Server Error"
      }
    }
  }

  async getCompanyProfile(user: any): Promise<any> {
    try {

      const existingUser = await this.userModel.findOne({ email: user.email });
      const user_id = (existingUser?._id as any).toString();

      console.log(existingUser);

      const profile = await this.companyProfileRepository.findOne({
        where: {
          user_id
        }
      })

      if (!profile) {
        return { status: false, message: "Credentials Incorrect", statusCode: HttpStatus.BAD_REQUEST };
      }

      return {
        status: true, message: "Request Allowed", statusCode: HttpStatus.OK, profile: profile
      }

    } catch (error) {
      console.error('Error saving company profile:', error.message);
      return {
        status: false,
        statusCode: HttpStatus.BAD_GATEWAY,
        message: "Internal Server Error"
      }
    }
  }

  async updateCompanyProfile(data: any): Promise<any> {
    try {
      const profile = await this.companyProfileRepository.findOne({
        where: { company_id: data.company_id },
      });

      if (!profile) {
        return {
          status: false,
          message: "Profile not found",
          statusCode: HttpStatus.BAD_REQUEST,
        };
      }

      // Merge updated fields into existing profile
      this.companyProfileRepository.merge(profile, data);

      // Save the updated profile
      const updatedProfile = await this.companyProfileRepository.save(profile);

      return {
        status: true,
        message: "Profile updated successfully",
        statusCode: HttpStatus.OK,
        profile: updatedProfile,
      };
    } catch (error) {
      console.error('Error updating company profile:', error.message);
      return {
        status: false,
        statusCode: HttpStatus.BAD_GATEWAY,
        message: "Internal Server Error",
      };
    }
  }


}
