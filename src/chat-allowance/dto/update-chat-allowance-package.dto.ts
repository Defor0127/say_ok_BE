import { PartialType } from "@nestjs/mapped-types";
import { CreateChatAllowancePackageDto } from "./create-chat-allowance-package.dto";

export class UpdateChatAllowancePackageDto extends PartialType(CreateChatAllowancePackageDto) {}

