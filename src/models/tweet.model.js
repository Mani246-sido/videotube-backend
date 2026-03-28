import mongoose,{Schema} from 'mongoose';
const TweetSchema = new Schema({
    content:{
        type: String,
        required: true,
        trim: true,
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
},
{ timestamps: true}
);
export const Tweet = mongoose.model('Tweet', TweetSchema);