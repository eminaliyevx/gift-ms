import { PrismaService } from "@app/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { CategoryController } from "../src/category.controller";

describe("CategoryController", () => {
  let categoryController: CategoryController;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: "./.env.test",
        }),
        HttpModule,
      ],
      controllers: [CategoryController],
      providers: [ConfigService, PrismaService],
    }).compile();

    categoryController = moduleRef.get<CategoryController>(CategoryController);
    prismaService = moduleRef.get<PrismaService>(PrismaService);

    await prismaService.attribute.createMany({
      data: [
        { id: "attr1", name: "attribute1" },
        { id: "attr2", name: "attribute2" },
      ],
    });

    await prismaService.category.create({
      data: {
        id: "cat1",
        name: "category1",
        attributes: { connect: [{ id: "attr1" }, { id: "attr2" }] },
      },
    });
  });

  describe("create", () => {
    it("should create category with attributes", async () => {
      const createCategoryDto = {
        name: "testCat",
        attributes: ["attr1", "attr2"],
      };

      const result = await categoryController.create(createCategoryDto);

      expect(result.name).toEqual(createCategoryDto.name);
      expect(result.attributes.map(({ id }) => id)).toEqual(
        createCategoryDto.attributes,
      );
    });
  });

  describe("find", () => {
    it("should find many categories", async () => {
      const result = await categoryController.findMany();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should find unique category", async () => {
      const result = await categoryController.findUnique("cat1");

      expect(result.name).toEqual("category1");
    });
  });

  describe("update", () => {
    it("should update category", async () => {
      const updateCategoryDto = {
        name: "category1 updated",
        attributes: ["attr1"],
      };

      const result = await categoryController.update("cat1", updateCategoryDto);

      expect(result.name).toEqual(updateCategoryDto.name);
      expect(result.attributes.map(({ id }) => id)).toEqual(
        updateCategoryDto.attributes,
      );
    });
  });

  describe("delete", () => {
    it("should delete category", async () => {
      const result = await categoryController.delete("cat1");

      expect(result.id).toEqual("cat1");
    });
  });
});
