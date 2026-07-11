import { ApiProperty } from '@nestjs/swagger';

export class BuildingStatusBreakdownDto {
  @ApiProperty({ description: 'Total buildings in PLANNING phase.', example: 2 })
  planning: number;

  @ApiProperty({ description: 'Total buildings in UNDER_CONSTRUCTION phase.', example: 3 })
  underConstruction: number;

  @ApiProperty({ description: 'Total buildings in COMPLETED phase.', example: 1 })
  completed: number;

  @ApiProperty({ description: 'Total buildings in COMMISSIONED phase.', example: 1 })
  commissioned: number;
}

export class BuildingTypeBreakdownDto {
  @ApiProperty({ description: 'Total Residential buildings.', example: 4 })
  residential: number;

  @ApiProperty({ description: 'Total Commercial buildings.', example: 2 })
  commercial: number;

  @ApiProperty({ description: 'Total Industrial buildings.', example: 0 })
  industrial: number;

  @ApiProperty({ description: 'Total Mixed-Use buildings.', example: 1 })
  mixedUse: number;

  @ApiProperty({ description: 'Total other classifications.', example: 0 })
  other: number;
}

export class ProjectBuildingsAnalyticsResponseDto {
  @ApiProperty({ description: 'The parent project ID.' })
  projectId: string;

  @ApiProperty({ description: 'Total quantity of buildings in project.', example: 7 })
  totalBuildings: number;

  @ApiProperty({ description: 'Cumulative sum of floors across all buildings.', example: 54 })
  totalFloors: number;

  @ApiProperty({ description: 'Cumulative sum of basement floors.', example: 6 })
  totalBasementFloors: number;

  @ApiProperty({ description: 'Cumulative sum of parking spaces.', example: 450 })
  totalParkingSpaces: number;

  @ApiProperty({ description: 'Cumulative floor area of all buildings (sqft).', example: 520000.0 })
  cumulativeArea: number;

  @ApiProperty({ type: BuildingStatusBreakdownDto })
  statusBreakdown: BuildingStatusBreakdownDto;

  @ApiProperty({ type: BuildingTypeBreakdownDto })
  typeBreakdown: BuildingTypeBreakdownDto;
}
