import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPost, updatePost, uploadImage } from '@/api/boardApi'
import { useToast } from '@/hooks/useToast'
import { BOARD_MSGS } from '@/constants/messages'
import PageLayout from '@/layouts/PageLayout'
import { ImagePlus, X } from 'lucide-react'

const BoardEditPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) { return }
    getPost(Number(id))
      .then(post => {
        setTitle(post.title)
        setContent(post.content)
        setImageUrls(post.imageUrls)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) { return }
    if (imageUrls.length + files.length > 5) {
      toast.error('이미지는 최대 5장까지 첨부할 수 있어요.')
      return
    }
    setIsUploading(true)
    try {
      const uploaded = await Promise.all(files.map(f => uploadImage(f)))
      setImageUrls(prev => [...prev, ...uploaded])
    } catch {
      toast.error('이미지 업로드에 실패했어요.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) { fileInputRef.current.value = '' }
    }
  }

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!id || !title.trim() || !content.trim() || isSaving) { return }
    setIsSaving(true)
    try {
      await updatePost(Number(id), { postType: 'FREE', title: title.trim(), content: content.trim(), imageUrls })
      toast.success(BOARD_MSGS.POST_UPDATED)
      navigate(`/board/${id}`, { replace: true })
    } catch {
      toast.error(BOARD_MSGS.POST_SAVE_ERROR)
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <PageLayout isLoading />
  }

  return (
    <PageLayout title="게시글 수정" onBack={true} hasFixedButton>
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

        {/* 이미지 첨부 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-semibold text-[#191F28]">
              사진
              {imageUrls.length > 0 && (
                <span className="ml-1.5 text-[13px] text-[#3182F6] font-medium">{imageUrls.length}/5</span>
              )}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || imageUrls.length >= 5}
              className="flex items-center gap-1 text-[13px] text-[#3182F6] font-medium disabled:opacity-40"
            >
              <ImagePlus size={15} />
              {isUploading ? '업로드 중...' : '추가'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />
          {imageUrls.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative shrink-0">
                  <img src={url} alt="" className="w-20 h-20 object-cover rounded-xl" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#191F28] rounded-full flex items-center justify-center"
                  >
                    <X size={11} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#F2F4F6] px-4 py-4 pb-safe">
        <button
          onClick={handleSubmit}
          disabled={isSaving || !title.trim() || !content.trim()}
          className="w-full bg-[#3182F6] text-white rounded-2xl py-4 text-[16px] font-semibold disabled:opacity-40"
        >
          {isSaving ? '수정 중...' : '수정 완료'}
        </button>
      </div>
    </PageLayout>
  )
}

export default BoardEditPage
