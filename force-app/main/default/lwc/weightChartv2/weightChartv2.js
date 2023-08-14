import { LightningElement, wire, api, track } from 'lwc';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { loadScript } from 'lightning/platformResourceLoader';
import CHART_JS from '@salesforce/resourceUrl/ChartJS23';

export default class WeightChartv2 extends LightningElement {
    chartInitialized = false;
    @api recordId;
    @track chart;

    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Histories',
        fields: ['Animal__History.CreatedDate', 'Animal__History.OldValue', 'Animal__History.NewValue'],
        where: '{ Field: {eq: "Animal__History.Current_Weight__c"}}'
     })
    fieldHistoryData({ error, data }){
        console.log('Data:' + data);
        if (data){
            const dates = [];
            const weights = [];
            data.forEach(entry => {
                dates.push(new Date(entry.CreatedDate).toLocaleDateString());
                weights.push(entry.NewValue);
            });

            if (!this.chartInitialized){
                this.chartInitialized(dates, weights);
            } else {
                this.updateChart(dates, weights);
            }
        }
    }

    initializeChart(dates, weights) {
        loadScript(this, CHART_JS)
            .then(() => {
                const ctx = this.template.querySelector('canvas').getContext( '2d' );
                this.chart = new window.Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [
                            {
                                label: 'Weight History',
                                data: weights,
                                borderColor: 'blue',
                                fill: false,
                            },
                        ],
                    },
                });
                this.initializeChart = true;
            })
            .catch(error => {
                console.log('Error loading Chart.js');
                console.log(error);
            });
    }
    updateChart(dates, weights){
        this.chart.data.labels = dates;
        this.chart.data.datasets[0].data = weights;
        this.chart.update();
    }
}
