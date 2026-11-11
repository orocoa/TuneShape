import type {HistoryConfig} from './history-model';
import type {PreviewCommand} from './useDetailPlayback';

export interface HistoryPreviewProps {
  config:HistoryConfig;
  speed:number;
  reduced:boolean;
  command:PreviewCommand;
  side:string;
  paused?:boolean;
  onRunningChange?:(side:string,running:boolean)=>void;
  enabled?:boolean;
  thumbnail?:boolean;
  autoPlay?:boolean;
  interactive?:boolean;
  presentation?:'loading'|'cycle'|'direct';
}
