import { Application } from 'egg';
import { wrapper } from 'egg-swagger-decorator';
import { WrapperOptions } from 'egg-swagger-decorator/dist/swaggerJSON';
import lodash from 'lodash';

export default function routerWrapper (app: Application, options?: WrapperOptions | undefined) {
  wrapper(app, options);

  // 路由重新排序, 把 路径参数路由全部放在后面, 防止路由冲突
  app.router.stack = lodash.sortBy(app.router.stack, (o) => {
    return o.path.includes(':') ? 1 : 0;
  });
};