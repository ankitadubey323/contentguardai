import mongoose from "mongoose";



const contentSchema = new mongoose.Schema(
  {
    
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },

    
    userId: {
      type: String,
      default: "anonymous",
    },

    
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    
    analysis: {
      
      toxicity: {
        is_toxic: Boolean,
        toxicity_score: Number, 
        categories: [String],
        severity: String, 
        explanation: String,
      },

      
      sentiment: {
        sentiment: String, 
        confidence: Number, 
        emotions: [String],
        tone: String,
      },

      
      summary: String,

      
      keywords: [String],

      
      language: String,

      
      processingTime: Number,
      model: String,
    },

    
    isFlagged: {
      type: Boolean,
      default: false,
    },

    moderationAction: {
      type: String,
      enum: ["none", "warned", "hidden", "removed"],
      default: "none",
    },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },

    
    error: {
      message: String,
      timestamp: Date,
    },
  },
  {
    timestamps: true, 
  }
);

contentSchema.index({ status: 1 });
contentSchema.index({ isFlagged: 1 });
contentSchema.index({ createdAt: -1 });

const Content = mongoose.model("Content", contentSchema);

export default Content;
