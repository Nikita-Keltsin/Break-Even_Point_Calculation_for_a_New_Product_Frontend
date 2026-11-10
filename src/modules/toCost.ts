import type { ApiBreakEvenPointJSON } from '../api/Api'
import { toProxyUrl } from './media'
import type { Cost } from './types'

// В списке приходит is_mine, в ленте — is_liked, в черновике ни того, ни другого
type CostResponse = ApiBreakEvenPointJSON & { is_mine?: number; is_liked?: number }

// Ответ веб-сервиса -> объект интерфейса: 0/1 -> boolean, адреса MinIO -> адреса через прокси.
// Swagger описывает поля как необязательные, а часть из них у черновика равна null.
export const toCost = (dto: CostResponse): Cost => ({
  id: dto.id ?? 0,
  cost_name: dto.cost_name ?? '',
  short_description: dto.short_description ?? '',
  image_url: toProxyUrl(dto.image_url ?? ''),
  video_url: toProxyUrl(dto.video_url ?? ''),
  amount_monthly: dto.amount_monthly ?? null,
  is_fixed: dto.is_fixed ?? null,
  creator_id: dto.creator_id ?? 0,
  created_at: dto.created_at ?? '',
  formed_at: dto.formed_at ?? null,
  likes_count: dto.likes_count ?? 0,
  is_mine: dto.is_mine === 1,
  is_liked: dto.is_liked === 1,
})
