import { wrapper } from 'egg-swagger-decorator';
import { WrapperOptions } from 'egg-swagger-decorator/dist/swaggerJSON';

export default function routerWrapper (app: any, options?: WrapperOptions | undefined) {
  wrapper(app, options);
};