import { LightningElement, api, wire } from 'lwc';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';

const COLUMNS = [
    { label: 'Date', fieldName: 'CreatedDate'},
    { label: 'Previous Value', fieldName: 'OldValue'},
    { label: 'NewValue', fieldName: 'NewValue'},
];

export default class DisplayAnimalHistory extends LightningElement {

    @api recordId;
    recordCount;
    error;
    records;
    columns = COLUMNS;

    @wire( getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Histories',
        fields: ['Animal__History.Id', 'Animal__History.CreatedDate', 'Animal__History.OldValue', 'Animal__History.NewValue'],
        where: '{ Field: {eq: "Current_Weight__c" }}',
        SortBy: ['Animal__History.CreatedDate']
    })animalHistories({ error, data}) {
        if (data) {
            console.log( 'Record ID is: ' & this.recordId);
            console.log( 'Data is: ', JSON.stringify( data ) );
            let tempRecords = [];

            data.records.forEach( obj => {
                console.log ( 'obj is: ', JSON.stringify( obj ));
                let tempRecord = {};
                tempRecord.Id = obj.fields.Id.value;
                tempRecord.CreatedDate = obj.fields.CreatedDate.value;
                tempRecord.OldValue = obj.fields.OldValue.value;
                tempRecord.NewValue = obj.fields.NewValue.value;
                tempRecords.push ( tempRecord );
            });

            this.records = tempRecords;
            this.recordCount = data.count;
            console.log ( 'Records are: ' + JSON.stringify( this.records ));
        } else if (error) {
            console.log(error);
            this.records = undefined;
        }
    }
}