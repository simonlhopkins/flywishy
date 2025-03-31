import { CityData } from "@/sharedTypes/CityData";
import { TypedEventTarget } from "typescript-event-target";

interface EventMap {
  cityChanged: CustomEvent<{ fromCity: CityData; toCity: CityData }>;
}
class Events {
  private static eventTarget = new TypedEventTarget<EventMap>();
  static Get() {
    return this.eventTarget;
  }
}

export default Events;
