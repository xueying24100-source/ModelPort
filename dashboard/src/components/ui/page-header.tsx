// design-system.md 要求 PageHeader 位于 components/ui/；实现保留在
// components/shared/PageHeader.tsx（已被多个业务页面引用），此处仅做转出，
// 避免重复实现导致两处代码漂移。
export { PageHeader } from '@/components/shared/PageHeader'
