import { Location } from './location';

export class PlanningItem{

    constructor(
      public startDate: string,
      public finishDate: string,
      public placeName : string,
      public placeId : string,
      public id : string
    ) {}
}
