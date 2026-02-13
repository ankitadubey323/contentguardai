import Content from "../models/content.js";
// import * as groqService from "./groqService.js"
import groqService from "./groqService.js";


// import ca from "./groqService.js";

const performAnalysis=async(contentId)=>{
    console.log(`starting analysis for contentId: ${contentId}`);
    try{
        const content =await Content.findById(contentId)
        if(!content){
            console.log(`Content with id ${contentId} not found`);
        }
        console.log(` Content retrieved: "${content.text.substring(0, 50)}..."`);

        content.status = "processing";
    await content.save();

    console.log(" Status updated to: processing");
    console.log(" Calling Groq AI service...");
    
        const aiAnalysis = await groqService.analyzeContent(content.text);
    
        console.log(" AI analysis complete");

        // flag to check if content is harmful
        const shouldFlag = shouldFlagContent(aiAnalysis);
    console.log(`   Flag content? ${shouldFlag}`);

    // Decision 2: What moderation action should we take?
    const moderationAction = determineModerationAction(aiAnalysis);
    console.log(`   Moderation action: ${moderationAction}`);

    // Decision 3: Calculate risk level
    const riskLevel = calculateRiskLevel(aiAnalysis);
    console.log(`   Risk level: ${riskLevel}`);


    content.analysis = {
      toxicity: aiAnalysis.toxicity,
      sentiment: aiAnalysis.sentiment,
      summary: aiAnalysis.summary,
      keywords: aiAnalysis.keywords,
      language: aiAnalysis.language,
      processingTime: aiAnalysis.processingTime,
      model: aiAnalysis.model,
    };

    content.isFlagged = shouldFlag;
    content.moderationAction = moderationAction;
    content.riskLevel = riskLevel;
    content.status = "completed";

    await content.save();

    console.log(" Database updated successfully");
    console.log(` Final result: ${shouldFlag ? "FLAGGED" : "SAFE"} - Action: ${moderationAction}`);
    return content;

}

    catch(error){
        
    console.error(` Analysis failed for ${contentId}:`, error.message);
    try {
          const content = await Content.findById(contentId);
          if (content) {
            content.status = "failed";
            content.error = {
              message: error.message,
              timestamp: new Date(),
            };
            await content.save();
    
            console.log("Content marked as failed in database");
          }
        } catch (dbError) {
          console.error(" Failed to update error status:", dbError.message);
        }
         throw error;

    }
}


function shouldFlagContent(analysis) {
  const toxicity = analysis.toxicity;

  // Criterion 1: High toxicity score
  if (toxicity.toxicity_score > 60) {
    console.log(`    Flag reason: High toxicity score (${toxicity.toxicity_score})`);
    return true;
  }

  // Criterion 2: High or critical severity
  if (toxicity.severity === "high" || toxicity.severity === "critical") {
    console.log(`    Flag reason: Severity is ${toxicity.severity}`);
    return true;
  }

  // Criterion 3: Contains harmful categories
  const harmfulCategories = [
    "hate_speech",
    "violence",
    "harassment",
    "threat",
    "explicit",
  ];

  const hasHarmfulCategory = toxicity.categories?.some((category) =>
    harmfulCategories.includes(category.toLowerCase())
  );

  if (hasHarmfulCategory) {
    console.log(`    Flag reason: Contains harmful category`);
    return true;
  }

  // No flagging criteria met
  console.log(`    No flagging needed`);
  return false;
}


function determineModerationAction(analysis) {
  const score = analysis.toxicity.toxicity_score || 0;

  if (score >= 80) {
    return "removed"; // Very toxic - remove immediately
  } else if (score >= 60) {
    return "hidden"; // Moderately toxic - hide from public
  } else if (score >= 40) {
    return "warned"; // Slightly toxic - show warning
  } else {
    return "none"; // Safe content - no action needed
  }
}


 
function calculateRiskLevel(analysis) {
  const score = analysis.toxicity.toxicity_score || 0;
  const severity = analysis.toxicity.severity;
  const categoriesCount = analysis.toxicity.categories?.length || 0;
  const isNegative = analysis.sentiment.sentiment === "negative";

  // Critical risk
  if (score >= 80 || severity === "critical") {
    return "critical";
  }

  // High risk
  if (score >= 60 || severity === "high" || categoriesCount >= 3) {
    return "high";
  }

  // Medium risk
  if (score >= 40 || severity === "medium" || (categoriesCount >= 1 && isNegative)) {
    return "medium";
  }

  // Low risk
  return "low";
}

export async function quickToxicityCheck(text) {
  console.log("\n Quick toxicity check...");

  try {
    
    const toxicity = await groqService.analyzeToxicity(text);

    const result = {
      isToxic: toxicity.is_toxic,
      score: toxicity.toxicity_score,
      severity: toxicity.severity,
      categories: toxicity.categories,
      recommendation: toxicity.is_toxic
        ? " This content may violate community guidelines"
        : " Content looks safe to post",
    };

    console.log(`Quick check: ${result.isToxic ? "TOXIC" : "SAFE"} (${result.score}/100)`);

    return result;
  } catch (error) {
    console.error(" Quick check failed:", error.message);
    throw error;
  }
}


export async function batchAnalysis(contentIds) {
  console.log(`\n Batch analyzing ${contentIds.length} items...`);

  const results = [];

  for (const id of contentIds) {
    try {
      const result = await performAnalysis(id);
      results.push({
        id,
        success: true,
        data: result,
      });

      console.log(` ${id}: Success`);
    } catch (error) {
      results.push({
        id,
        success: false,
        error: error.message,
      });

      console.log(` ${id}: Failed - ${error.message}`);
    }
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(`\n Batch complete: ${successCount}/${contentIds.length} succeeded`);

  return results;
}


export async function reAnalyzeContent(contentId) {
  console.log(`\n Re-analyzing content: ${contentId}`);

  
  return await performAnalysis(contentId);
}


 
export async function getAnalysisStats(userId = null) {
  console.log("\n Getting analysis statistics...");

  try {
    const query = userId ? { userId } : {};

    const stats = await Content.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          flagged: {
            $sum: { $cond: ["$isFlagged", 1, 0] },
          },
          removed: {
            $sum: { $cond: [{ $eq: ["$moderationAction", "removed"] }, 1, 0] },
          },
          hidden: {
            $sum: { $cond: [{ $eq: ["$moderationAction", "hidden"] }, 1, 0] },
          },
          warned: {
            $sum: { $cond: [{ $eq: ["$moderationAction", "warned"] }, 1, 0] },
          },
          avgToxicityScore: {
            $avg: "$analysis.toxicity.toxicity_score",
          },
        },
      },
    ]);

    const result = stats[0] || {
      total: 0,
      flagged: 0,
      removed: 0,
      hidden: 0,
      warned: 0,
      avgToxicityScore: 0,
    };

    console.log(`Stats retrieved: ${result.flagged}/${result.total} flagged`);

    return result;
  } catch (error) {
    console.error("Failed to get stats:", error.message);
    throw error;
  }
}


export default {
  performAnalysis,        // Main function - complete pipeline
  quickToxicityCheck,     // Fast check without DB save
  batchAnalysis,          // Analyze multiple items
  reAnalyzeContent,       // Re-analyze existing content
  getAnalysisStats,       // Get statistics
};
    
   