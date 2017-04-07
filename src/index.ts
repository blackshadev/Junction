﻿import { RoadieServer } from "./http";
import { WebService as ws } from "./webservice";

export {
    WebService,
} from "./webservice";
export {
    RoadieServer as Server,
    WebMethod,
    HttpError,
    HttpVerb,
} from "./http";
export {
     IRouter,
     StaticRouter,
} from "./routing/routemap";

export function setDefaultServer(serv: RoadieServer) { RoadieServer.default = serv; }
