import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ClassConstructor } from 'class-transformer/types/interfaces';

// 验证配置函数，将普通对象转换为类实例并进行验证
function validateConfig<T extends object>(
  config: Record<string, unknown>,
  envVariablesClass: ClassConstructor<T>,
) {
  // 将普通对象转换为类实例，启用隐式类型转换
  const validatedConfig = plainToClass(envVariablesClass, config, {
    enableImplicitConversion: true,
  });
  // 验证类实例，不跳过任何属性
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  // 如果有验证错误，抛出错误
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  // 返回验证并转换后的配置对象
  return validatedConfig;
}

export default validateConfig;
