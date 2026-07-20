import { useState } from 'react';
import { useCvBuilderStore } from '../store/useCvBuilderStore';


const mockGenerateSuggestion = async (jobTitle: string): Promise<string> => {
  await new Promise((r) => setTimeout(r, 600));
  return `Là ${jobTitle || 'ứng viên'} với đam mê phát triển sản phẩm, tôi hướng đến việc đóng góp chuyên môn để tối ưu hiệu suất và mang lại giá trị thực cho người dùng, đồng thời không ngừng nâng cao kỹ năng qua từng dự án.`;
};

export const AiSuggestions = () => {
  const jobTitle = useCvBuilderStore((state) => state.data.personalInfo.jobTitle);
  const updateSummary = useCvBuilderStore((state) => state.updateSummary);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    const result = await mockGenerateSuggestion(jobTitle);
    setSuggestion(result);
    setLoading(false);
  };

  return (
    <div className="rounded-[8px] border border-[#d9d9e3] bg-[#ffffff] p-5 shadow-sm">
      <h3 className="mb-2 font-bold text-[#111827]">Gợi ý viết CV</h3>
      <p className="mb-4 text-xs text-[#6b7280]">
        Tạo gợi ý nội dung cho mục "Mục tiêu nghề nghiệp" dựa trên vị trí ứng tuyển.
      </p>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mb-4 w-full rounded-[8px] py-2 text-sm font-medium text-white shadow-md transition-all hover:opacity-90 disabled:opacity-60"
        style={{ background: 'linear-gradient(to right, #f23b94, #ff6a21)' }}
      >
        {loading ? 'Đang tạo gợi ý...' : 'Tạo gợi ý'}
      </button>

      {suggestion && (
        <div className="rounded-md border border-[#d9d9e3] bg-[#f7f6fb] p-3">
          <p className="mb-3 text-sm text-[#374151]">{suggestion}</p>
          <button
            onClick={() => updateSummary(suggestion)}
            className="text-xs font-medium text-[#f23b94] hover:underline"
          >
            Dùng gợi ý này
          </button>
        </div>
      )}
    </div>
  );
};