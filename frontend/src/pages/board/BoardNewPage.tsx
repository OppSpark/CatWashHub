import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPost } from '@/api/boardApi'
import { useToast } from '@/hooks/useToast'
import { BOARD_MSGS } from '@/constants/messages'
import PageLayout from '@/layouts/PageLayout'

const BoardNewPage = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) { return }
    if (isSaving) { return }
    setIsSaving(true)
    try {
      const post = await createPost({ title: title.trim(), content: content.trim() })
      toast.success(BOARD_MSGS.POST_CREATED)
      navigate(`/board/${post.id}`, { replace: true })
    } catch {
      toast.error(BOARD_MSGS.POST_SAVE_ERROR)
      setIsSaving(false)
    }
  }

  return (
    <PageLayout title="글쓰기" onBack={true} hasFixedButton>
      <div className="flex flex-col gap-3">

        <div className="bg-white rounded-2xl px-5 py-4">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={BOARD_MSGS.PLACEHOLDER_TITLE}
            maxLength={200}
            className="w-full text-[16px] font-semibold text-[#191F28] outline-none placeholder:text-[#ADB5C0]"
          />
        </div>

        <div className="bg-white rounded-2xl px-5 py-4">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={BOARD_MSGS.PLACEHOLDER_CONTENT}
            rows={15}
            className="w-full text-[14px] text-[#191F28] outline-none resize-none placeholder:text-[#ADB5C0]"
          />
        </div>

      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#F2F4F6] px-4 py-4 pb-safe">
        <button
          onClick={handleSubmit}
          disabled={isSaving || !title.trim() || !content.trim()}
          className="w-full bg-[#3182F6] text-white rounded-2xl py-4 text-[16px] font-semibold disabled:opacity-40"
        >
          {isSaving ? '등록 중...' : '등록'}
        </button>
      </div>
    </PageLayout>
  )
}

export default BoardNewPage
