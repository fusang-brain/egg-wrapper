import { wrapper } from 'egg-swagger-decorator';
import { WrapperOptions } from 'egg-swagger-decorator/dist/swaggerJSON';

export default (app: any, options?: WrapperOptions | undefined) => {
  wrapper(app, options);
};