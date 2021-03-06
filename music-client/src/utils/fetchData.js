import {
    isEmptyObject
} from 'utils/isEmptyObject'
var qs = require('querystringify');

function checkStatus(type, dispatch, response) {

    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        var error = new Error(response.statusText)
        error.response = response
        dispatch({
            type,
            payload: {
                content: response,
                status: -5
            }
        })
        throw error
    }
}

function parseJSON(response) {
    return response.json()
}
/* 状态码
-1 暂无数据
1 正常获取到数据
0 正在请求数据
-5 获取数据出错 */
const fetchData = (type, url, data, field /* 判断是否为空值的字段 */ ,sign) => {
    var querystringify = qs.stringify(data, true)
    if (type) {
        return dispatch => {
            dispatch({
                type,
                payload: {
                    content: null,
                    status: 0
                }
            })
            return fetch(`${url}${querystringify}`, {
                    credentials: 'include',
                    method: "GET",
                    cache: "no-cache",
                    mode: "cors"
                }).then(response => checkStatus(type, dispatch, response)).then(parseJSON)
                .then(body => {
                    if (body.code === 200 && body[field] != null && !isEmptyObject(body[field])) {
                        if(!sign){
                            dispatch({
                                payload: {
                                    content: body[field],
                                    status: 1
                                },
                                type
                            })
                        }else{
                            dispatch({
                                payload: {
                                    total:body.total,
                                    content: body[field],
                                    status: 1
                                },
                                type
                            })
                        }
                        
                    } else {
                         dispatch({
                            payload: {
                                content: null,
                                status: -1
                            },
                            type
                        })
                    }
                    return body
                }).catch((e)=>{
                    dispatch({
                        
                        payload:{
                            content:null,
                            status:-5,
                        },
                        type
                    })
                })
        }
    }
    return 
}
export default fetchData