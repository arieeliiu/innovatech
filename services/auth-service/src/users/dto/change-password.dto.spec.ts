import { validate } from "class-validator";
import { ChangePasswordDto } from "./change-password.dto";

describe("ChangePasswordDto", () => {
  it("accepts current and new passwords with the minimum length", async () => {
    const dto = new ChangePasswordDto();
    dto.currentPassword = "actual1";
    dto.password = "nueva123";

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("rejects missing or short passwords", async () => {
    const dto = new ChangePasswordDto();
    dto.currentPassword = "123";
    dto.password = "";

    const errors = await validate(dto);

    expect(errors.map((error) => error.property).sort()).toEqual([
      "currentPassword",
      "password",
    ]);
  });
});
