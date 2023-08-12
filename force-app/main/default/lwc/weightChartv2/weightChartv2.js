import { LightningElement, wire, api } from 'lwc';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { loadScript } from 'lightning/platformResourceLoader';
import CHART_JS from '@salesforce/resourceUrl/ChartJS23';

const FIELDS = ['animalshelters__Animal__History.CreatedDate', 'animalshelters__Animal__History.OldValue', 'animalshelters__Animal__History.NewValue'];

export default class WeightChartv2 extends LightningElement {
    
    @api recordId;

    @wire(getRelatedListRecords, {recordId: '$recordId', parentId: 'animalshelters__Animal__History.ParentId', relationshipApiName: 'animalshelters__Animal__History', fields: FIELDS, where: "animalshelters__Animal_History.Field = 'animalshelters__Current_Weight__c' AND animalshelters_Animal_History.ParentId = '$recordId'" })
    fieldHistoryData;

    chartInitialized = false;

    renderedCallback() {
        if (this.chartInitialized){
            return;
        }
        this.chartInitialized = true;

        Promise.all([
            loadScript(this, CHART_JS + '/Chart.min.js'),
            // loadStyle(this, CHART_JS + '/Chart.mic.css')
        ])
        .then(() => {
            this.initializeChart();
        })
        .catch(error => {
            console.log('Error loading Chart.js');
            console.log(error);
        });
    }
    initializeChart() {
        if (!this.fieldHistoryData.data){
            return;
        }
        const ctx = this.template.querySelector('#lineChart').getContext( '2d' );

        const data = {
            labels: this.fieldHistoryData.data.map(item => new Date(item.fields.animalshelters__Animal__History.CreatedDate.value)),
            datasets: [
                {
                    label: 'Weight Changes',
                    data: this.fieldHistoryData.data.map(item => item.fields.animalshelters__Animal__History.NewValue.value),
                    borderColor: 'blue',
                    fill: false
                }
            ]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };
        new window.Chart(ctx, config);
    }
}