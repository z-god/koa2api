'use strict'

const _ = require('lodash')
var xss = require('xss')
var mongoose =  require('mongoose')
var User = mongoose.model('User')
var uuid = require('uuid')
// var userHelper = require('../dbhelper/userHelper')
const gravatar = [
  '//img.souche.com/20161230/png/58f22ad636a0f33bad8762688f78d425.png',
  '//img.souche.com/20161230/png/6cdcda90c2f86ba1f45393cf5b26e324.png',
  '//img.souche.com/20161230/png/f9d10bb683d940dd14dc1b1344e89568.png',
  '//img.souche.com/20161230/png/8bb4f0fd45ed6ae26533eadd85f0f7ea.png',
  '//img.souche.com/20161230/png/0795744371fd5869af6cab796bdacb95.png',
  '//img.souche.com/20161230/png/bc836261fbb654dda6b653e428014279.png',
  '//img.souche.com/20161230/png/fd9f8aecab317e177655049a49b64d02.png'
]

import userHelper from '../dbhelper/userHelper'
/**
 * 登陆
 */
exports.login = async (ctx,next) =>{
  var phoneNumber = xss(ctx.request.body.phoneNumber.trim())
  var passWord =xss(ctx.request.body.passWord.trim())
  var user = await User.findOne({
    phoneNumber: phoneNumber,
    passWord:passWord
  }).exec()
  if(user){
    ctx.body = {
      success: true,
      user
    }
  }
  else{
    ctx.body = {
      error: '账号或密码错误'
    }
  }
  return next
}
/**
 * 注册新用户
 * @param {Function} next          [description]
 * @yield {[type]}   [description]
 */
exports.signup = async (ctx, next) => {
  var phoneNumber = xss(ctx.request.body.phoneNumber.trim())
  var nickname = xss(ctx.request.body.nickname.trim())
  var passWord = xss(ctx.request.body.passWord.trim())
	var user = await User.findOne({
	  phoneNumber: phoneNumber
	}).exec()
  console.log(user)
	
	var verifyCode = Math.floor(Math.random()*10000+1)
  console.log(phoneNumber)
	if (!user) {
	  var accessToken = uuid.v4()
    const len = gravatar.length
	  user = new User({
      nickname: nickname,
      passWord: xss(passWord),
	    avatar: gravatar[_.random(0, len - 1)],
	    phoneNumber: xss(phoneNumber),
	    verifyCode: verifyCode,
	    accessToken: accessToken
	  })
	}
	else {
	  user.verifyCode = verifyCode
	}

	try {
    user = await user.save()
    ctx.body = {
      success: true,
      user
    }
  }
  catch (e) {
    ctx.body = {
      success: false
    }
    return next
  }

}

/**
 * 更新用户信息操作
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.update = async (ctx, next) => {
  var body = ctx.request.body
  var user = ctx.session.user
  var fields = 'avatar,gender,age,nickname,breed'.split(',')

  fields.forEach(function(field) {
    if (body[field]) {
      user[field] = xss(body[field].trim())
    }
  })

  user = await user.save()

  ctx.body = {
    success: true,
    data: {
      nickname: user.nickname,
      accessToken: user.accessToken,
      avatar: user.avatar,
      age: user.age,
      breed: user.breed,
      gender: user.gender,
      _id: user._id
    }
  }
}



/**
 * 数据库接口测试
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.users = async (ctx, next) => {
  var data = await userHelper.findAllUsers()
  // var obj = await userHelper.findByPhoneNumber({phoneNumber : '13525584568'})
  // console.log('obj=====================================>'+obj)
  
  ctx.body = {
    success: true,
    data
  }
}
exports.addUser = async (ctx, next) => {
  var user = new User({
      nickname: '测试用户',
      avatar: 'http://ip.example.com/u/xxx.png',
      phoneNumber: xss('13800138000'),
      verifyCode: '5896',
      accessToken: uuid.v4()
    })
  var user2 =  await userHelper.addUser(user)
  if(user2){
    ctx.body = {
      success: true,
      data : user2
    }
  }
}
exports.deleteUser = async (ctx, next) => {
  const phoneNumber = xss(ctx.request.body.phoneNumber.trim())
  console.log(phoneNumber)
  var data  = await userHelper.deleteUser({phoneNumber})
  ctx.body = {
    success: true,
    data
  }
}