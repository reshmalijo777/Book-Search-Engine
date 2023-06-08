const {AuthenticationError} = require("apollo-server-express");
const {User} = require("../models");
const {signToken} =require("../utils/auth")

const resolvers={
    Query :{
      // By adding context to our query, we can retrieve the logged in user without specifically searching for them
        me: async (parent, args, context) => {
            if (context.user) {
              return userData.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('You need to be logged in!');
          },
    },

    Mutation: {
        addUser: async(parent,args) =>{
            const user =await User.create(args);
            const token =signToken(user)

            return {token,user}
        },
        login: async (parent, { email, password }) => {
            const user= await User.findOne({ email });
      
            if (!user) {
              throw new AuthenticationError('No profile with this email found!');
            }
      
            const correctPw = await user.isCorrectPassword(password);
      
            if (!correctPw) {
              throw new AuthenticationError('Incorrect password!');
            }
      
            const token = signToken(user);
            return { token, user };
          },

      // Add a third argument to the resolver to access data in our `context`
      saveBook: async(parent,args,context) =>{
      // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
      if(context.user){
        return updateUser.findByIdAndUpdate(
          {_id: context.user._id},
          { $addToSet:{savedBooks:args.input}},
          {new:true}
        );
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError('You need to be logged in!');
      },

     // Make it so a logged in user can only remove a book
     removeBook: async (parent, { skill }, context) => {
      if (context.user) {
        return updateUser.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: {bookId:args.bookId} } },
          { new: true }
        );
      }
      throw new AuthenticationError('You need to be logged in!');
    },
   },
}

module.exports = resolvers;
