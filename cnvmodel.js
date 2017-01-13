/**
 * Created by temp on 17/1/12.
 */
import mongoose from 'mongoose'

var Schema = mongoose.Schema;

var cnvSchema = new Schema({
    time: Date,
    sample: String,
    path: String,
    cut: String,
    status: String,
    result_path: String,
})

export default mongoose.model("CNV", cnvSchema);
