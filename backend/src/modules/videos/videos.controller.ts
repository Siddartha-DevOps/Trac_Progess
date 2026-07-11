import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { InitUploadDto } from './dto/init-upload.dto';
import { UploadChunkDto } from './dto/upload-chunk.dto';
import { QueryVideoDto } from './dto/query-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoResponseDto, PaginatedVideoResponseDto, VideoUploadSessionResponseDto } from './dto/video-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { Permissions } from '../../common/auth/permissions.decorator';

@ApiTags('Videos Module')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('videos')
export class VideosController {
  constructor(private readonly service: VideosService) {}

  @Post('init')
  @Permissions('building.update')
  @ApiOperation({ summary: 'Initialize a video chunk upload session on S3' })
  @ApiResponse({ status: HttpStatus.CREATED, type: VideoUploadSessionResponseDto })
  async initUpload(@Body() initDto: InitUploadDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.initUploadSession(initDto, userId);
  }

  @Post('upload/:uploadToken')
  @Permissions('building.update')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a video chunk to S3' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'The video binary chunk' },
        chunkIndex: { type: 'integer', example: 0, description: '0-based index of the chunk' },
        totalChunks: { type: 'integer', example: 10, description: 'Total chunks count' },
      },
    },
  })
  async uploadChunk(
    @Param('uploadToken') uploadToken: string,
    @Body() body: UploadChunkDto,
    @UploadedFile() file: any,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    const buffer = file?.buffer || Buffer.alloc(0);
    return this.service.uploadChunk(uploadToken, body.chunkIndex, body.totalChunks, buffer, userId);
  }

  @Get('session/:uploadToken')
  @Permissions('building.read')
  @ApiOperation({ summary: 'Get current upload progress and uploaded chunks for resume support' })
  @ApiResponse({ status: HttpStatus.OK, type: VideoUploadSessionResponseDto })
  async getSessionStatus(@Param('uploadToken') uploadToken: string) {
    return this.service.getSessionStatus(uploadToken);
  }

  @Get()
  @Permissions('building.read')
  @ApiOperation({ summary: 'List and filter videos' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedVideoResponseDto })
  async findAll(@Query() query: QueryVideoDto) {
    return this.service.findAllVideos(query);
  }

  @Get(':id')
  @Permissions('building.read')
  @ApiOperation({ summary: 'Get details of a single video' })
  @ApiResponse({ status: HttpStatus.OK, type: VideoResponseDto })
  async findOne(@Param('id') id: string) {
    return this.service.findVideoById(id);
  }

  @Patch(':id')
  @Permissions('building.update')
  @ApiOperation({ summary: 'Update video name, description, 360 status or metadata' })
  @ApiResponse({ status: HttpStatus.OK, type: VideoResponseDto })
  async update(@Param('id') id: string, @Body() updateDto: UpdateVideoDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.updateVideo(id, updateDto, userId);
  }

  @Delete(':id')
  @Permissions('building.update')
  @ApiOperation({ summary: 'Soft-delete a video' })
  @ApiResponse({ status: HttpStatus.OK, type: VideoResponseDto })
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.softDeleteVideo(id, userId);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @Permissions('building.update')
  @ApiOperation({ summary: 'Restore a soft-deleted video' })
  @ApiResponse({ status: HttpStatus.OK, type: VideoResponseDto })
  async restore(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.restoreVideo(id, userId);
  }
}
