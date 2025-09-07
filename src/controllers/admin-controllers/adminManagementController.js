// manage isntitues students and inetrnships 

const { default: mongoose } = require("mongoose");
const Institute = require("../../models/institutes");

exports.getInstituteFullDetails = async (req, res) => {
  try {
    const { instituteId } = req.params;

    const result = await Institute.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(instituteId) } },
      {
        $lookup: {
          from: "internships",
          localField: "_id",
          foreignField: "instituteId",
          as: "internships"
        }
      },
      {
        $lookup: {
          from: "applications",
          localField: "internships._id",
          foreignField: "internshipId",
          as: "applications"
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "applications.studentId",
          foreignField: "_id",
          as: "students"
        }
      }
    ]);

    res.json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
