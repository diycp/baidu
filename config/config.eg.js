/**
 * 配置文件例子
 */
module.exports = {

    ENVIRONMENT: 'PRODUCTION',//生产:PRODUCTION  开发:DEVELOPMENT
    DEFAULT_TITLE: "VMCSHOP+",
    // BASE_URL: 'https://demo.vmcshop.com',//DEMO
    // BASE_HOST: 'https://demo.vmcshop.com',
    BASE_URL: 'https://app.vmcyun.com',//SAAS
    BASE_HOST: 'https://app.vmcyun.com',
    // BASE_URL: 'http://develop.vmcshop.com',//DEV
    // BASE_HOST: 'http://develop.vmcshop.com',

    RUN_ON_SAAS: false,
    host_pre: "1817085wxa",
    client_id: 502,
    order_id: "4218083730443",
    app_type: 'wxa',
    app_year: 2018,
    app_sec: 17085,
    TPLMSGID:{
        'AT0002':'xcX7zNeoWfRtKqZNPxsevO3c1wmdNc5_s1qMs7O4n50',//订单创建成功
        'AT0007':'qVZF2GT0QKHh6crIjYV6dL9Bw11ovFQ-N5MZVeBJvog'//订单发货通知
    }
}
