
const mongoose = require("mongoose");

const courseSchema = mongoose.Schema({
    
    "title": {
        "type": "String"
    },
    "description": {
        type: "String"
    },
    "subscribers": {
      "teachers": {
        "type": [
          "Mixed"
        ]
      },
      "students": {
        "type": [
          "Mixed"
        ]
      }
    },
    "elements": {
      "type": [
        "Mixed"
      ]
    },
    "tasks": {
      "type": [
        "Mixed"
      ]
    },
    "vr_tasks": {
      "type": [
        "Mixed"
      ]
    }
  });

module.exports = mongoose.model('Course', courseSchema);