import { LightningElement, wire, api, track } from 'lwc';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import CHART_JS from '@salesforce/resourceUrl/ChartJS23';

export default class WeightChartv2 extends LightningElement {
    @track isChartJsInitialized;
    chart;
    data;
    error;
    @api recordId;

    // Get History Records for current Animal

    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Histories',
        fields: ['Animal__History.CreatedDate', 'Animal__History.OldValue', 'Animal__History.NewValue'],
        where:  '{ Field : {eq: "Current_Weight__c" } }',
        sortBy: ['Animal__History.CreatedDate']
     })
     fieldHistoryData;

    // Chart Config
    chartData = {
        labels: this.fieldHistoryData.data.map(record => record.CreatedDate),
        datasets: [{
            label: 'Weight History',
            data: this.fieldHistoryData.data.map(record => record.NewValue),
            fill: false
        }]
    };

    config = {
        type: 'line',
        data: this.chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    };

    //Build Chart
    renderedCallback() {
        if (this.isChartJsInitialized) {
            return;
        }
        this.isChartJsInitialized = true;

        Promise.all([
            loadScript(this, CHART_JS)
        ]).then(() => {
            const ctx = this.template.querySelector('canvas').getContext( '2d');
            this.chart = new window.Chart(ctx, this.config);
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading ChartJS',
                    message: error.message,
                    variant: 'error',
                }),
            );

        });
    }
}
