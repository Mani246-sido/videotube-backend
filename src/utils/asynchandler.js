const asynchandler = (requesthandler) => {
    //next is a callback function and middleware function in express
    return (req,res,next) => {
        //wrapping the requesthandler in a promise to catch any errors
        Promise.resolve(requesthandler(req,res,next))
        //catching any errors and passing them to the next middleware
        .catch((err)=> next(err));


    }
}

export {asynchandler}