import React, { useState } from "react";
import images from "../../../constants/images";

interface Question {
  id: string;
  question: string;
  answer: string;
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questions: Question[]) => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ isOpen, onClose, onSave }) => {
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", question: "", answer: "" },
    { id: "2", question: "", answer: "" }
  ]);

  const handleQuestionChange = (id: string, field: "question" | "answer", value: string) => {
    setQuestions(prev => 
      prev.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  const addNewQuestion = () => {
    const newId = (questions.length + 1).toString();
    setQuestions(prev => [...prev, { id: newId, question: "", answer: "" }]);
  };

  const handleSave = () => {
    onSave(questions);
    onClose();
  };

  const handleClose = () => {
    // Reset questions when closing
    setQuestions([
      { id: "1", question: "", answer: "" },
      { id: "2", question: "", answer: "" }
    ]);
    onClose();
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white w-[500px] relative h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add New FAQ</h2>
          <button
            onClick={handleClose}
            className="p-2 cursor-pointer rounded-full transition-colors"
          >
           <img src={images.close} alt="Close" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-4">
              <h3 className="text-xl font-medium text-black">Question {index + 1}</h3>
              
              {/* Question Input */}
              <div className="space-y-2">
                <label className="block text-xl font-medium text-black">
                  Question
                </label>
                <input
                  type="text"
                  placeholder="Type Question"
                  value={question.question}
                  onChange={(e) => handleQuestionChange(question.id, "question", e.target.value)}
                  className="w-full p-5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent"
                />
              </div>

              {/* FAQ Answer Textarea */}
              <div className="space-y-2">
                <label className="block text-xl font-medium text-black">
                  FAQ Answer
                </label>
                <textarea
                  placeholder="Type Answer"
                  value={question.answer}
                  onChange={(e) => handleQuestionChange(question.id, "answer", e.target.value)}
                  rows={4}
                  className="w-full p-5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent resize-none"
                />
              </div>

              {/* Divider between questions (except for the last one) */}
              {index < questions.length - 1 && (
                <div className="border-b-3 border-gray-500 pt-2"></div>
              )}
            </div>
          ))}

          {/* Add New Button */}
          <button
            onClick={addNewQuestion}
            className="w-full py-4 border border-gray-300 rounded-lg text-sm font-medium cursor-pointer text-black hover:bg-gray-50 transition-colors"
          >
            Add New
          </button>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="w-full py-4 cursor-pointer bg-[#E53E3E] text-white text-sm font-medium rounded-lg hover:bg-[#D32F2F] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;