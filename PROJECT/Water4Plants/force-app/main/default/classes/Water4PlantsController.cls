public with sharing class Water4PlantsController {
    public Water4PlantsController() {
    }
    @AuraEnabled(cacheable=true)
    public static List<Plant__c> getThirstyPlants(Id rootLocationId) {
        // Return thirsty plants whose root location matches 'rootLocationId'
        // Note: For production app, implement pagination and handle security exceptions gracefully
        List<Plant__c> plants;
        if (rootLocationId != NULL) {
            plants = [
                SELECT Id, Name, Nickname__c, Kind__c, Last_Watering__c, Watering_Period__c, Location__r.Name
                FROM Plant__c
                WHERE Requires_Watering__c = TRUE AND Location__r.RootLocationId = :rootLocationId
                WITH SECURITY_ENFORCED
            ];
        }
        else {
            plants = [
                SELECT Id, Name, Nickname__c, Kind__c, Last_Watering__c, Watering_Period__c, Location__r.Name
                FROM Plant__c
                WHERE Requires_Watering__c = TRUE
                WITH SECURITY_ENFORCED
            ];
        }
        return plants;
    }
}