import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class NotificationsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(userId: string, title: string, message: string, type: string = 'info') {
    const { data, error } = await this.supabaseService.getClient()
      .from('notifications')
      .insert([{ user_id: userId, title, message, type }])
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findAll(userId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async markAsRead(id: string, userId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
