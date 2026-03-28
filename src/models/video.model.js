import mongoose, {Schema} from 'mongoose';
//pagination plugin used for videos listing
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
const videoSchema = new Schema(
    {
        title:{
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        description:{
            type: String,
            
        },
        thumbnail:{
            type: String, //cloudinary url
            required: true,
        },
        videoUrl:{
            type: String, //cloudinary url
            required: true,
        },
        views:{
            type: Number,
            default: 0,
        },
        duration:{
            type: Number, //in seconds
            required: true,
        },
        isPublished:{
            type: Boolean,
            default: true,

        },
        owner:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',

        }





    },{ timestamps: true})
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model('Video', videoSchema);