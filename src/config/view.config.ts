
interface IConfig {
    [prop: string]: string;
}

let config: IConfig = {
    //WebApi
    devApi: "http://127.0.0.1:3000/",
    //WebApi(上线)
    prodApi: "/",
}

export default config;