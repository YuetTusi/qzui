
interface IConfig {
    [prop: string]: string;
}
interface IApps {
    [prop: string]: any;
}

let config: IConfig = {
    //WebApi
    devApi: "http://127.0.0.1:3000/",
    //WebApi(上线)
    prodApi: "/",
}

let apps: IApps = {

};


export default config;