import { PartialType } from "@nestjs/mapped-types";
import { CreateHubContentDto } from "./create-hub-content.dto";

export class UpdateHubContentDto extends PartialType(CreateHubContentDto) {};

