/*global define */
define(['jquery', 'underscore', 'backbone', 'views/MetricModalView'],
    function($, _, Backbone, MetricModalView) {
    'use strict';

    var MetricView = Backbone.View.extend({

        tagName: 'a',
        // id: 'metrics-button',
        className: 'btn metrics',
        metricName: null,
        model: null,

        //Templates
        metricButtonTemplate:  _.template( "<span class='metric-icon'> <i class='icon" +
                            " <%=metricIcon%>'></i> </span>" +
                            "<span class='metric-name'> <%=metricName%> </span>" +
                            "<span class='metric-value'> <i class='icon metric-icon icon-spinner icon-spin'>" +
                            "</i> </span>"),

        events: {
            "click" : "showMetricModal",
        },

        initialize: function(options){
            if((typeof options == "undefined")){
                var options = {};
            }

            this.metricName = options.metricName;
            this.model = options.model;
            this.pid = options.pid;
        },

        render: function () {
            // Generating the Button view for the given metric
            if  (this.metricName == 'Citations') {
                this.$el.html(this.metricButtonTemplate({metricValue:'', metricIcon:'icon-quote-right', metricName:this.metricName}));
            } else if (this.metricName == 'Downloads') {
                this.$el.html(this.metricButtonTemplate({metricValue:'', metricIcon:'icon-cloud-download', metricName:this.metricName}));
            } else if (this.metricName == 'Views') {
                this.$el.html(this.metricButtonTemplate({metricValue:'', metricIcon:'icon-eye-open', metricName:this.metricName}));
            } else {
                this.$el.html('');
            };

            // Adding tool-tip for the buttons
            // TODO: Change to 'Show metricName', once you've the modals working.
            if (MetacatUI.appModel.get("displayDatasetMetricsTooltip")) {
                this.$el.addClass("tooltip-this")
                        .attr("data-placement", "top")
                        .attr("data-trigger", "hover")
                        .attr("data-delay", "700")
                        .attr("data-container", "body");
                if  (this.metricName == 'Citations') {
                    this.$el.attr("data-title", "For all the versions of this dataset, the number of times that all or part of this dataset was cited.");
                } else if (this.metricName == 'Downloads') {
                    this.$el.attr("data-title", "For all the versions of this dataset, the number of times that all or part of this dataset was downloaded.");
                } else if (this.metricName == 'Views') {
                    this.$el.attr("data-title", "For all the versions of this dataset, the number of times that all or part of this dataset was viewed.");
                } else {
                    this.$el.attr("data-title", "");
                }
            };

            // waiting for the fetch() call to succeed.
            this.listenTo(this.model, "sync", this.renderResults);

            // in case when there is an error for the fetch call.
            this.listenTo(this.model, "error", this.renderError);

            return this;
        },


        // Handling the Click function
        // Displaying the metric modal on Click
        showMetricModal: function(e) {
            if (MetacatUI.appModel.get("displayMetricModals") && ((this.model.get("totalCitations")+this.model.get("totalDownloads")+this.model.get("totalViews") != 0))) {
                var modalView = new MetricModalView({metricName: this.metricName, metricsModel: this.model, pid: this.pid});
                modalView.render();
                modalView.show();

                //Send this event to Google Analytics
                if(MetacatUI.appModel.get("googleAnalyticsKey") && (typeof ga !== "undefined")){
                  ga("send", "event", "metrics", "Click metric", this.metricName);
                }
            }
        },

        renderResults: function() {
            var total = this.model.get("total"+this.metricName);
            // Check if the metric object exists in results obtained from the service 
            // If it does, get its total value else set the total count to 0

            // Replacing the metric total count with the spinning icon.
            
            this.$('.metric-value').text(MetacatUI.appView.numberAbbreviator(total, 1));
            this.$('.metric-value').addClass("badge");

            if((this.model.get("totalCitations") == 0) && (this.model.get("totalDownloads") == 0) && (this.model.get("totalViews") == 0)) {
                this.$el.removeClass("metrics");
                this.$el.addClass("metrics-button-disabled");
                this.$el.click(function(){return false;});
            }
        },

        renderError: function() {
            // Replacing the spinning icon with a question-mark
            // when the metrics are not loaded
            var iconEl = this.$('.metric-value').find('.metric-icon');
            iconEl.removeClass('icon-spinner');
            iconEl.removeClass('icon-spin');
            iconEl.addClass("icon-exclamation-sign more-info");

            // Setting the error tool-tip
            this.$el.removeAttr("data-title");

            this.$el.addClass("metrics-button-disabled");
            this.$el.attr("data-title", "The number of " + this.metricName + " could not be retreived at this time.");
        }

    });

    return MetricView;
});
