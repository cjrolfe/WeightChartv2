import { LightningElement, wire, api, track } from 'lwc';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import CHART_JS from '@salesforce/resourceUrl/ChartJS23';

export default class WeightChartv2 extends LightningElement {
    @track chartInitialized;
    @api recordId;
    @track chart;
    dates = [];
    weights = [];
  

    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Histories',
        fields: ['Animal__History.CreatedDate', 'Animal__History.OldValue', 'Animal__History.NewValue'],
        where:  '{ Field : {eq: "Current_Weight__c" } }',
        sortBy: ['Animal__History.CreatedDate']
     })
    fieldHistoryData( error, data ){

        console.log('Record ID: ' + this.recordId);
        console.log('Data ' + JSON.stringify(data));
        console.log(error);

    };

    renderedCallback() {
        if (this.chartInitialized) {
            return;
        }
        this.chartInitialized = true;

        Promise.all([
            loadScript(this, CHART_JS)
        ]).then(() => {
            this.prepareChartData();
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading ChartJS',
                    message: error.message,
                    variant: 'error',
                }),
            );

        });
    }

    prepareChartData(){

        if (!this.fieldHistoryData.data) {
            return;
        }

        this.fieldHistoryData.forEach(entry => {
            dates.push(new Date(entry.Animal__History.CreatedDate).toLocaleDateString());
            weights.push(entry.Animal__History.NewValue);
        });

        const ctx = this.template.querySelector('canvas.linechart').getContext( '2d' );
        
        const chartData = {
            labels: dates,
            datasets: [{
                label: 'Weight History',
                data: this.weights,
                fill: false,
                borderColor: 'blue',
            }]
        };

        const config = {
            type: 'line',
            data: chartData,
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };
        new window.Chart(ctx, config);
    }

}
