import React from 'react';
import Icon from '../../../components/AppIcon';

const MotivationalQuote = ({ quote }) => {
  return (
    <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl p-6 border border-accent/20 shadow-elevation-1">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Icon name="Quote" size={24} className="text-accent" strokeWidth={2.5} />
        </div>
        
        <div className="flex-1">
          <blockquote className="text-lg font-medium text-foreground leading-relaxed mb-3">
            "{quote?.text}"
          </blockquote>
          <cite className="text-sm text-muted-foreground font-medium">
            — {quote?.author}
          </cite>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-accent/10">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Daily Motivation</span>
          <div className="flex items-center space-x-2">
            <button className="p-1 hover:bg-accent/10 rounded transition-colors">
              <Icon name="Share2" size={16} className="text-muted-foreground" />
            </button>
            <button className="p-1 hover:bg-accent/10 rounded transition-colors">
              <Icon name="Bookmark" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotivationalQuote;