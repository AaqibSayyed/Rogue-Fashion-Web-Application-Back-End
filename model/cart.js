const joi = require('joi')
const { sequelize, Cart, Op } = require('../schema/cart_schema')


// add cart 

async function verifyAddCart(params) {
    let schema = joi.object({
        product_id: joi.number().required(),
        product_name: joi.string().max(255).required(),
        quantity: joi.number().required()
    })

    let valid = await schema.validateAsync(params, { abortEarly: false }).catch((error) => { return { error } })
    if (!valid || (valid && valid.error)) {
        let msg = []
        for (let i of valid.error.details) {
            msg.push(i.message)
        }
        return { error: msg }
    }

    return { data: valid }
}

async function modelAddcart(params, userData) {
    let check = await verifyAddCart(params).catch((error) => { return { error } })
    if (!check || (check && check.error)) {
        return { error: check.error }
    }

    let find_product = await Cart.findOne({ where: { user_id: userData.id, product_id: params.product_id } }).then((data) => { return { data } }).
        catch((error) => { return { error } })

    if (find_product.data) {
        return { error: "This product is already in your list" }
    }

    else if (find_product.error) {
        return { error: find_product.error }
    }

    format_insert = {
        user_id: userData.id,
        user_name: userData.name,
        product_id: params.product_id,
        product_name: params.product_name,
        quantity: params.quantity
    }

    let add_to_cart = await Cart.create(format_insert).catch((error) => { return { error } })
    if (!add_to_cart || (add_to_cart && add_to_cart.error)) {
        return { error: add_to_cart.error }
    }

    return { data: add_to_cart }
}

//remove items from cart 

async function verifyRemoveCartItems(params) {
    let schema = joi.object({
        product_id: joi.number().required()
    })

    let valid = await schema.validateAsync(params, { abortEarly: false }).catch((error) => { return { error } })
    if (!valid || (valid && valid.error)) {
        let msg = []
        for (let i of valid.error.details) {
            msg.push(i.message)
        }
        return { error: msg }
    }

    return { data: valid }
}

async function modelRemoveCartItems(params, userData) {
    let check = await verifyRemoveCartItems(params).catch((error) => { return { error } })
    if (!check || (check && check.error)) {
        return { error: check.error }
    }

    let find_cart_product = await Cart.findAll({ where: { product_id: params.product_id, user_id: userData.id } }).then((data) => { return { data } }).catch((error) => { return { error } })


    if (find_cart_product.data.length == 0) {
        return { error: "No items in cart to remove" }
    }

    else if (!find_cart_product || (find_cart_product && find_cart_product.error)) {
        return { error: find_cart_product.error }
    }

    let remove_cart_product = await Cart.destroy({ where: { id: find_cart_product.data[0].id } }).catch((error) => { return { error } })
    if (!remove_cart_product || (remove_cart_product && remove_cart_product.error)) {
        return { error: remove_cart_product.error }
    }
    return { data: "Product has been removed successfully from your cart" }
}

async function verifyUpdateCart(params) {
    let schema = joi.object({
        product_id: joi.number().required(),
        quantity: joi.number().required()
    })

    let valid = await schema.validateAsync(params, { abortEarly: false }).catch((error) => { return { error } })
    if (!valid || (valid && valid.error)) {
        let msg = []
        for (let i of valid.error.details) {
            msg.push(i.message)
        }
        return { error: msg }
    }
    return { data: valid }
}

async function modelUpdateCart(params, userData) {
    let check = await verifyUpdateCart(params).catch((error) => { return { error } })
    if (!check || (check && check.error)) {
        return { error: check.error }
    }

    let find_cart_product = await Cart.findOne({ where: { product_id: params.product_id, user_id: userData.id } }).then((data) => { return { data } }).catch((error) => { return { error } })

    if (!find_cart_product.data) {
        return { error: "No such items in your cart to update the quantity" }
    }

    else if (find_cart_product.error) {
        return { error: find_cart_product.error }
    }

    let update_cart = await Cart.update({ quantity: params.quantity, updatedAt: "2023-08-03" }, { where: { product_id: params.product_id, user_id: userData.id } }).catch((error) => { return { error } })
    if (!update_cart || (update_cart && update_cart.error)) {
        return { error: update_cart.error }
    }

    return { data: update_cart }

}

//view cart 

async function modelViewCart(userData) {
    let find_user_cart_product = await Cart.findAll({ where: { user_id: userData.id } }).then((data) => { return { data } }).catch((error) => {
        return { error }
    })

    if (find_user_cart_product.data.length == 0) {
        return { error: "No product in your cart" }
    }

    else if (find_user_cart_product.error) {
        return { error: find_user_cart_product.error }
    }

    let get_product_details = await sequelize.query(`select user.Id as user_id, user.user_name , product.id as product_id, product.name as product_name, product.total_amount as per_product_amout, cart.quantity as product_quantity
    from cart 
    left join user on user.Id= cart.user_id 
    left join product on product.id = cart.product_id
    where user.Id=${userData.id}`, {type: sequelize.QueryTypes.SELECT}).then((data)=>{return {data}}).catch((error)=>{
        return {error}
    })
    

    let total_amout = 0
    for (let i in get_product_details.data){
        let final_price = get_product_details.data[i].per_product_amout*get_product_details.data[i].product_quantity
        total_amout+=final_price
    }

    let cart_details = {...get_product_details.data, total_amout}


    return { data: cart_details }


}


module.exports = { modelAddcart, modelRemoveCartItems, modelUpdateCart, modelViewCart }


