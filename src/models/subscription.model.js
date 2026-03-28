import mongoose,{Schema} from 'mongoose';
const SubscriptionSchema = new Schema({
    subscriber:{
        type: mongoose.Schema.Types.ObjectId,//one who is susbcribing
        ref: 'User',
    },
    channel:{
        type: mongoose.Schema.Types.ObjectId,//one who is being subscribed to
        ref: 'User',
},},
    { timestamps: true})
export const Subscription = mongoose.model('Subscription', SubscriptionSchema);
