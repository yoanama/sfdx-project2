import { LightningElement, wire } from 'lwc';
import { subscribe, unsubscribe, MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import COMMAND_CENTER_MSG_CHANNEL from '@salesforce/messageChannel/lightning__CommandCenterMessageChannel';
import getThirstyPlants from '@salesforce/apex/Water4PlantsController.getThirstyPlants';
const columns = [
    { label: 'Plant', fieldName: 'plantUrl', 'initialWidth': 100, 'type': 'url', typeAttributes: { label: { fieldName: 'name' } }},
    { label: 'Kind', fieldName: 'kind', type: 'text' },
    { label: 'Last Watered', fieldName: 'lastWatered', type: 'date', typeAttributes:{
        year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"} },
    { label: 'Location', fieldName: 'location', type: 'text' }
];
export default class Water4PlantsCard extends LightningElement {
    globalLocationName;
    globalLocationId;
    subscription;
    error;
    columns = columns;
    plants = Array();
@wire(MessageContext)
messageContext;
@wire(getThirstyPlants, { rootLocationId: '$globalLocationId' })
response(value) {
        const { error, data } = value;
        if (data) {
            // Transform Salesforce object data into format for display in data table
            this.plants = Array();
            for (var i = 0; i < data.length; i++) {
            let plantUrl = (typeof(data[i].Name) != 'undefined') ? '/'+data[i].Id : '';
                this.plants.push ({
                    'id': data[i].Id,
                    'plantUrl': plantUrl,
                    'name': data[i].Name,
                    'kind': data[i].Kind__c,
                    'lastWatered': data[i].Last_Watering__c,
                    'location': data[i].Location__r.Name
                });
            }
            this.error = undefined;
        }
        else if (error) {
            this.error = error;
            this.issues = [];
        }
    }
    connectedCallback() {
        this.subscribeToChannel();
    }
    /**
    * Subscribe to Command Center Message Channel to listen to global filter changes
    */
    subscribeToChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(this.messageContext, COMMAND_CENTER_MSG_CHANNEL, message => this.handleEvent(message), {
                scope: APPLICATION_SCOPE
            });
        }
    }
    /**
    * Any time global filter changes are captured get updated values
    * @param  {} message
    */
    handleEvent(message) {
        switch (message.EventType) {
            case 'CC_LOCATION_CHANGE': {
                /* This event returns two attributes within it's EventPayload (locationName & locationId) */
                this.globalLocationName = message.EventPayload.locationName;
                this.globalLocationId = message.EventPayload.locationId;
                break;
            }
            default: {
                break;
            }
        }
    }
    /**
    * If disconnected unsubscribe from Message Channel
    */
    disconnectedCallback() {
        if (this.subscription) {
            unsubscribe(this.subscription);
        }
    }
}