import { useState } from 'react'
import { CV_TEMPLATES } from '../_components/cv-templates/TemplateRegistry'
import { TemplateCard } from './components/TemplateCard'


const CATEGORIES = [
  { id: 'all', key: 'all' },
  { id: 'it', key: 'it' },
  { id: 'marketing', key: 'marketing' },
  { id: 'sales', key: 'sales' },
  { id: 'hr', key: 'hr' },
]

export function CvTemplatesPage() {
  
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredTemplates = CV_TEMPLATES.filter((template) =>
    template.categories.includes(activeCategory)
  )

  return (
    <div className="min-h-screen bg-[#f7f6fb] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4">
            
            Mẫu CV theo vị trí ứng tuyển
          </h1>

          <p className="text-base text-[#6b7280]">
            
            Tạo CV ngay - Chốt Job liền tay. Khám phá hàng chục mẫu thiết kế CV
            đẹp.
          </p>
        </div>

        
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border ${
                activeCategory === cat.id
                  ? 'bg-[#111827] text-white border-[#111827]'
                  : 'bg-white text-[#6b7280] border-[#d9d9e3] hover:text-[#111827]'
              }`}
            >
              {}
              {cat.key.toUpperCase()}
            </button>
          ))}
        </div>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>

        {}
        {filteredTemplates.length === 0 && (
          <div className="text-center text-[#6b7280] py-20">
            Không tìm thấy mẫu CV phù hợp với danh mục này.
          </div>
        )}
      </div>
    </div>
  )
}

export default CvTemplatesPage