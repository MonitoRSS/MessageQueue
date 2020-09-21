import { MikroORM } from "@mikro-orm/core";
import DeliveryRecord from "../entities/DeliveryRecord";
import { ApiMetaType } from "../schemas/ApiMeta";
import { ArticleMetaType } from "../schemas/ArticleMeta";
import { RawPayloadType } from "../schemas/RawPayload";
import { FeedMetaType } from "../schemas/FeedMeta";
import log from "./log";
import GeneralStat from "../entities/GeneralStat";

class Payload {
  article: ArticleMetaType
  feed: FeedMetaType
  api: ApiMetaType
  constructor (data: RawPayloadType) {
    this.article = data.article
    this.feed = data.feed
    this.api = data.api
  }

  /**
   * Record a payload's successful delivery/request to Discord
   */
  async recordSuccess(orm: MikroORM) {
    log.debug('Recording delivery record success')
    const record = new DeliveryRecord(this, true)
    try {
      await orm.em.nativeInsert(record)
      await GeneralStat.increaseNumericStat(orm, GeneralStat.keys.ARTICLES_SENT)
    } catch (err) {
      log.error(`Failed to record article delivery success(${err.message})`, {
        record
      })
    }
  }

  /**
   * Record a payload's failed delivery/request to Discord
   */
  async recordFailure (orm: MikroORM, message: string) {
    log.debug('Recording delivery record failure', {
    })
    const record = new DeliveryRecord(this, false)
    record.comment = message
    try {
      await orm.em.nativeInsert(record)
    } catch (err) {
      log.error(`Failed to record article delivery failure (${err.message})`, {
        record
      })
    }
  }

  /**
   * Serialize payload to store in Redis
   */
  toJSON () {
    return {
      article: this.article,
      feed: this.feed,
      api: this.api
    }
  }
}

export default Payload
