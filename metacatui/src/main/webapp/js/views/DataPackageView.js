﻿/* global define */
define([
    'jquery',
    'underscore',
    'backbone',
    'collections/DataPackage',
    'models/DataONEObject',
    'models/metadata/ScienceMetadata',
    'models/metadata/eml211/EML211', 'views/DataItemView',
    'text!templates/dataPackage.html'], 
    function($, _, Backbone, DataPackage, DataONEObject, ScienceMetadata, EML211, DataItemView, DataPackageTemplate) {
        'use strict';
        
        /*
         *  The main view of a Data Package in the editor.  The view is
         *  composed of a citation section at the top, a file/folder browser
         *  below it, followed by a metadata viewer below that, which has a nav
         *  sidebar, and a metadata content section.
         */
        var DataPackageView = Backbone.View.extend({
                        
            tagName: "table",
            
            className: "table table-striped table-hover",
            
            id: "data-package-table",
            
            subviews: [],
            
            template: _.template(DataPackageTemplate),
            
            initialize: function(options) {
                // listen for change (not add) events because models are being merged
                this.listenTo(MetacatUI.rootDataPackage, 'change', this.addOne); // render new items
                this.listenTo(MetacatUI.rootDataPackage, 'reset', this.addAll); // render all items
                
                return this;
                
            },
            
            /*
             *  Render the DataPackage HTML
             */
            render: function() {

                this.$el.append(this.template());
                
                return this;
            },
            
            /*
             * Add a single DataItemView row to the DataPackageView
             */
            addOne: function(item) {
                console.log("DataPackageView.addOne called for " + item);
                
                var dataItemView = new DataItemView({model: item});
                this.subviews.push(dataItemView); // keep track of all views
                $('#data-package-table-body').append(dataItemView.render().el);
                
            },
            
            /*
             * Add all rows to the DataPackageView
             */
            addAll: function() {
                this.$('data-package-table-body').html(''); // clear the table first
                MetacatUI.rootDataPackage.each(this.addOne, this);
                
            },
            
            /*
             * Close subviews as needed
             */
            onClose: function() {
                // Close each subview
                _.each(this.subviews, function(i, subview) {
    				subview.onClose();
                
                });
            
                this.subviews = [];
                
            }
            
        });
        return DataPackageView;
});